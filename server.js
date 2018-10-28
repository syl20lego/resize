const sharp = require('sharp')
const glob = require('glob')

const OPTIONS = {
  // http://sharp.pixelplumbing.com/en/stable/
  // jpegQuality: 80,
  // jpegProgressive: false,
  // jpegChromaSubsampling: '4:2:0',
  // jpegTrellisQuantisation: false,
  // jpegOvershootDeringing: false,
  // jpegOptimiseScans: false,
  // jpegOptimiseCoding: true,
  // jpegQuantisationTable: 0,            
}
const SIZES = [600, 800, 1200, 1600]
const FILES = 'img/**/*-original.jpg'

const formats = file => SIZES.map(size => ({
  size,
  file: file.replace('original', size)
}))

const mapping = files =>
  files.map(file => ({
    source: file,
    outputs: formats(file)
  }))

const listFiles = new Promise((resolve, reject) =>
  glob(FILES, (err, files) =>
    err ? reject(err) : resolve(files)
  ))

const resize = async () => {
  try {
    const files = await listFiles
    mapping(files).map(async convert => {
      const image = sharp(convert.source)
      convert.outputs.map(async output => {
        await image
          .clone()
          .metadata()
          .then(({ width, height }) =>
            image.jpeg(OPTIONS)
              .resize({
                width: width > height ? output.size: undefined,
                height: height > width ? output.size: undefined,
              })
              .toFile(output.file)
          )
      })
    })
  } catch (error) {
    console.log(error)
  }
}

// Execute resize
resize()
