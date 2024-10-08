'use client'
import destr from 'destr'
import { useState } from 'react'
import axios from 'axios'
import { MagnifyingGlassIcon, UsersIcon } from '@heroicons/react/20/solid'

export default function Home() {
  const [manifest, setManifest] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [processedManifest, setProcessedManifest] = useState(null)

  const handleManifestUpload = (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      const manifestContent = e.target.result

      // Extract packageID using the provided regular expression
      const extractPackageID = (content) => {
        const regex = /"packageID"\s*:\s*"?(\d+)"?/
        const match = content.match(regex)
        return match ? match[1] : null
      }

      const packageID = extractPackageID(manifestContent)
      console.log('Extracted packageID:', packageID)

      // Extract the manifest object using regular expressions
      const extractManifestObject = (content) => {
        const filesRegex = /"Files"\s*:\s*(\[[\s\S]*?\])/
        const packageIDRegex = /"packageID"\s*:\s*"?(\d+)"?/
        const chunkIDToDependenciesRegex =
          /"ChunkIDToDependencies"\s*:\s*(\{[\s\S]*?\})/

        const filesMatch = content.match(filesRegex)
        const packageIDMatch = content.match(packageIDRegex)
        const chunkIDToDependenciesMatch = content.match(
          chunkIDToDependenciesRegex
        )

        const files = filesMatch ? destr(filesMatch[1]) : []
        const packageID = packageIDMatch ? packageIDMatch[1] : null
        const chunkIDToDependencies = chunkIDToDependenciesMatch
          ? destr(chunkIDToDependenciesMatch[1])
          : {}

        return {
          Files: files,
          Dependencies: {
            packageID: packageID,
            ChunkIDToDependencies: chunkIDToDependencies,
          },
        }
      }

      const extractedManifest = extractManifestObject(manifestContent)
      setManifest(extractedManifest)
    }

    reader.readAsText(file)
  }

  const handleSearch = async () => {
    console.log('Sending request with manifest:', manifest)
    console.log('Sending request with searchTerm:', searchTerm)
    const response = await axios.post('/api/manifest', { manifest, searchTerm })
    console.log('Response from server:', response.data)
    setProcessedManifest(response.data)
  }

  return (
    <main>
      <div className='py-40 w-full'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium leading-6 text-slate-600'
          >
            Search Unreal Engine assets
          </label>
          <div className='mt-2 flex  shadow-sm'>
            <div className='relative flex flex-grow items-stretch focus-within:z-10'>
              <input
                type='file'
                accept='.json'
                onChange={handleManifestUpload}
                className='w-24 relative -ml-px -mr-px inline-flex items-center gap-x-1.5 rounded-l-md px-3 py-2 text-sm font-semibold text-slate-400 ring-1 ring-inset ring-slate-800 hover:bg-slate-900'
              />
            </div>
            <input
              id='search'
              name='search'
              placeholder='Asset title'
              aria-describedby='email-optional'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='block w-full border-0 py-1.5 pl-8 text-slate-400 ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-indigo-900 sm:text-sm sm:leading-6'
            />
            <button
              type='button'
              className='relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-slate-400 ring-1 ring-inset ring-slate-800 hover:bg-slate-900'
              onClick={handleSearch}
            >
              <MagnifyingGlassIcon
                aria-hidden='true'
                className='-ml-0.5 h-5 w-5 text-slate-400'
              />
              Search
            </button>
          </div>
        </div>
        <div className='spacer'></div>
        <div className='output bg-gray-950 p-8 rounded-xl' >

        {processedManifest && (
          <pre>{JSON.stringify(processedManifest, null, 2)}</pre>
        )}
        </div>
      </div>
    </main>
  )
}
