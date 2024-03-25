import * as crypto from 'crypto'
import * as fs from 'fs'

// Function to generate a random secret key using crypto module
const generateSecretKey = () => {
  const randomBytes = crypto.randomBytes(32)
  return randomBytes.toString('hex')
}

// Function to update the .env file with a new SECRET_KEY
const updateEnvFile = (filePath, envContents) => {
  // Generate a new secret key
  const newSecretKey = generateSecretKey()

  // Add or update the SECRET_KEY entry in the contents
  let updatedContents = ''
  if (envContents.includes('SECRET_KEY=')) {
    updatedContents = envContents.replace(/(SECRET_KEY=).*/, `$1${newSecretKey}`)
  } else {
    updatedContents = `${envContents.trim()}\nSECRET_KEY=${newSecretKey}`
  }

  // Write the updated .env file
  fs.writeFileSync(filePath, updatedContents)
}

// Check if the script is running in a local environment
if (process.env.NODE_ENV !== 'development') {
  console.log('Script can only be run in a local environment.')
  process.exit(0)
}

const envPath = '.env'
const exampleEnvPath = '.env.example'

// Check if the .env file exists
if (fs.existsSync(envPath)) {
  const envContents = fs.readFileSync(envPath, 'utf-8')

  // Check if SECRET_KEY is empty or not found
  if (envContents.includes('SECRET_KEY=')) {
    const secretKeyIndex = envContents.indexOf('SECRET_KEY=') + 11
    const newlineIndex = envContents.indexOf('\n', secretKeyIndex)
    const secretKey = envContents.substring(secretKeyIndex, newlineIndex).trim()

    if (secretKey === '') {
      updateEnvFile(envPath, envContents)
    } else {
      console.log('SECRET_KEY already exists and is not empty.')
    }
  } else {
    updateEnvFile(envPath, envContents)
  }
} else {
  const exampleEnvContents = fs.readFileSync(exampleEnvPath, 'utf-8')
  updateEnvFile(envPath, exampleEnvContents)
}

console.log('.env file updated successfully with a new SECRET_KEY.')
