/* global URL, history */
var createGame = require('voxel-engine')
var highlight = require('voxel-highlight')
var player = require('voxel-player')
var extend = require('extend')
var fly = require('voxel-fly')
var walk = require('voxel-walk')
var Hasher = require('./hasher')

var voxels = {}

var materials = [
  '#008000', // grass
  '#eaeaea', // light gray
  '#afafaf',  // medium gray
  '#808080', // dark gray
  '#01a3ff', // blue for windonws
  '#d40000',  // red
  '#3b7663',  // dark green
  '#fd572a',  // orange
  '#f2ca02'  // yellow
]

var params = (new URL(document.location)).searchParams

if (params.has('c')) {
  // parse custom colors
  params.get('c').split(',').map(function (col, idx) {
    materials[idx] = '#' + col
  })
}

module.exports = function (opts, setup) {
  setup = setup || defaultSetup
  var defaults = {
    generate: function (x, y, z) {
      return y === 1 ? 1 : 0
    },
    chunkDistance: 2,
    materials: materials,
    materialFlatColor: true,
    worldOrigin: [0, 0, 0],
    controls: {discreteFire: true}
  }
  opts = extend({}, defaults, opts || {})

  // setup the game and add some trees
  var game = createGame(opts)
  var container = opts.container || document.body
  window.game = game // for debugging
  game.appendTo(container)
  if (game.notCapable()) return game

  var createPlayer = player(game)

  // create the player from a minecraft skin file and tell the
  // game to use it as the main player
  var avatar = createPlayer(opts.playerSkin || 'player.png')
  avatar.possess()
  avatar.yaw.position.set(2, 14, 4)

  setup(game, avatar)

  Hasher.encodeHash(params.get('d'), function (voxel) {
    var pos = [voxel[0], voxel[1], voxel[2]]
    voxels[pos] = voxel[3]
    game.setBlock(pos, voxel[3])
  })

  game.on('setBlock', function (pos, val, old) {
    if (pos[1] <= 1) return // dont dig land
    if (val === 0) {
      delete voxels[pos]
    } else {
      voxels[pos] = val
    }
    var newHash = Hasher.encodeVoxels(voxels)
    params.set('d', newHash)
    history.replaceState(null, null, '?' + params.toString())
  })

  return game
}

function defaultSetup (game, avatar) {
  var makeFly = fly(game)
  var target = game.controls.target()
  game.flyer = makeFly(target)

  // highlight blocks when you look at them, hold <Ctrl> for block placement
  var blockPosPlace, blockPosErase
  var hl = game.highlighter = highlight(game, {
    adjacentActive: function () {
      return !game.controls.state.alt
    },
    color: 0xff0000
  })
  hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos })
  hl.on('remove', function (voxelPos) { blockPosErase = null })
  hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos })
  hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null })

  // toggle between first and third person modes
  window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) {
      avatar.toggle()
    }
    if (ev.keyCode === '1'.charCodeAt(0)) {
      currentMaterial = 1
    }
    if (ev.keyCode === '2'.charCodeAt(0)) {
      currentMaterial = 2
    }
    if (ev.keyCode === '3'.charCodeAt(0)) {
      currentMaterial = 3
    }
    if (ev.keyCode === '4'.charCodeAt(0)) {
      currentMaterial = 4
    }
    if (ev.keyCode === '5'.charCodeAt(0)) {
      currentMaterial = 5
    }
    if (ev.keyCode === '6'.charCodeAt(0)) {
      currentMaterial = 6
    }
    if (ev.keyCode === '7'.charCodeAt(0)) {
      currentMaterial = 7
    }
    if (ev.keyCode === '8'.charCodeAt(0)) {
      currentMaterial = 8
    }
    if (ev.keyCode === '9'.charCodeAt(0)) {
      currentMaterial = 9
    }
  })

  // block interaction stuff, uses highlight data
  var currentMaterial = 2

  game.on('fire', function (target, state) {
    var position = blockPosPlace
    if (position) {
      game.createBlock(position, currentMaterial)
    } else {
      position = blockPosErase
      if (position && position[1] > 1) game.setBlock(position, 0)
    }
  })

  game.on('tick', function () {
    walk.render(target.playerSkin)
    var vx = Math.abs(target.velocity.x)
    var vz = Math.abs(target.velocity.z)
    if (vx > 0.001 || vz > 0.001) walk.stopWalking()
    else walk.startWalking()
  })
}
