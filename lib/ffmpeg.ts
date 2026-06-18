import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos')
const THUMBNAILS_DIR = path.join(UPLOADS_DIR, 'thumbnails')

// Ensure dirs exist
async function ensureDirs() {
  await fs.mkdir(VIDEOS_DIR, { recursive: true })
  await fs.mkdir(THUMBNAILS_DIR, { recursive: true })
}

export async function generateThumbnail(videoPath: string, videoId: string): Promise<string> {
  await ensureDirs()
  const thumbnailFilename = `${videoId}.jpg`
  const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFilename)
  const outputPath = path.join(THUMBNAILS_DIR, thumbnailFilename)

  return new Promise((resolve, reject) => {
    // Extract thumbnail at 5 seconds or 10% into video
    const ffmpeg = spawn('ffmpeg', [
      '-i', videoPath,
      '-ss', '5',           // seek to 5s
      '-vframes', '1',
      '-vf', 'scale=640:-1', // nice thumbnail size
      '-y',
      outputPath
    ])

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(`/uploads/thumbnails/${thumbnailFilename}`)
      } else {
        // Fallback: try at 1s if failed
        const fallback = spawn('ffmpeg', ['-i', videoPath, '-ss', '1', '-vframes', '1', '-vf', 'scale=640:-1', '-y', outputPath])
        fallback.on('close', (code2) => {
          if (code2 === 0) resolve(`/uploads/thumbnails/${thumbnailFilename}`)
          else reject(new Error(`FFmpeg thumbnail failed with code ${code}`))
        })
      }
    })

    ffmpeg.on('error', reject)
  })
}

export async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      videoPath
    ])

    let output = ''
    ffprobe.stdout.on('data', (data) => { output += data.toString() })
    ffprobe.on('close', (code) => {
      if (code === 0) {
        const duration = parseFloat(output.trim())
        resolve(isNaN(duration) ? 0 : duration)
      } else {
        resolve(0) // fallback
      }
    })
    ffprobe.on('error', () => resolve(0))
  })
}

export async function saveVideoFile(file: File, videoId: string): Promise<{ filename: string; path: string; size: number }> {
  await ensureDirs()
  const extension = file.name.split('.').pop() || 'mp4'
  const filename = `${videoId}.${extension}`
  const filePath = path.join(VIDEOS_DIR, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filePath, buffer)

  return {
    filename,
    path: filePath,
    size: file.size
  }
}
