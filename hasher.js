/* global base64js */

function dencodeVoxel (arr, idx) {
  var coords = [arr[idx], arr[idx + 1], arr[idx + 2], 0]
  coords[0] = (coords[0] | ((arr[idx + 3] & 0x3) << 8)) - 512
  coords[1] = (coords[1] | (((arr[idx + 3] >> 2) & 0x1) << 8)) - 256
  coords[2] = (coords[2] | (((arr[idx + 3] >> 3) & 0x3) << 8)) - 512
  coords[3] = arr[idx + 3] >> 5
  return coords
}

function encodeHash (hash, itemCB) {
  if (!hash || hash.length === 0) return
  try {
    var e = base64js.toByteArray(hash)
    // load by quadruples
    var idx = 0
    while (idx < e.length) {
      var c = dencodeVoxel(e, idx)
      itemCB(c)
      idx += 4
    }
  } catch (err) {
    console.log('wrong data, empty scene')
  }
}

function encodeVoxel (pos, color, arr, idx) {
  var coords = pos.split(',').map(function (i) {
    return Number(i)
  })
  coords[0] += 512
  coords[1] += 256
  coords[2] += 512
  arr[idx] = coords[0] & 0xff
  arr[idx + 1] = coords[1] & 0xff
  arr[idx + 2] = coords[2] & 0xff
  // zbytky + color
  arr[idx + 3] = ((coords[0] >> 8) & 0x3) | // highest 2bits of coords[0]
    (((coords[1] >> 8) & 0x1) << 2) | // highest bit of coords[1]
    (((coords[2] >> 8) & 0x3) << 3) | // highest 2bits of coords[2]
    ((color & 0x7) << 5)                      // color
}

function encodeVoxels (voxels) {
  var u8 = new Uint8Array(Object.keys(voxels).length * 4)
  var idx = 0
  for (var pos in voxels) {
    encodeVoxel(pos, voxels[pos], u8, idx)
    idx += 4
  }
  return base64js.fromByteArray(u8)
}

module.exports = {
  encodeHash: encodeHash,
  encodeVoxels: encodeVoxels
}
