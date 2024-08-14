'use client'
import { useState } from 'react'
import _ from 'lodash'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { JSONTree } from 'react-json-tree'

export default function Home () {
  const [result, setResult] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [processedManifest, setProcessedManifest] = useState(null)

  const handleManifestUpload = (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
      const manifestContent = e.target.result
      const fixedBigInt = manifestContent.replace(/(?<=[,\s\[{]|^)(\d{12,42})(?=[,\s\]}]|$)/g, '"$1"')
      const parsed = JSON.parse(fixedBigInt)

      const fixed = {
        ...parsed,
        Files: parsed.Files.map((fl) => {
          const assetChunkId = fl.ChunkId.slice(0, 16)
          const decimalChunkId = BigInt(`0x${assetChunkId}`).toString()
          return {
            ...fl,
            ChunkId: decimalChunkId
          }
        })
      }
      const keyedFiles = _.keyBy(fixed.Files, 'ChunkId')
      const resultDeps = Object.entries(fixed.Dependencies.ChunkIDToDependencies).map(([key, cd]) => {
        return {
          ...cd,
          savedKey: key,
          dependencies: cd.dependencies && cd.dependencies.map((d) => {
            return keyedFiles[d]
          })
        }
      })
      setResult(resultDeps)
    }

    reader.readAsText(file)
  }

  const handleSearch = async () => {
    console.log('Sending request with searchTerm:', searchTerm)

    const foundChunks = result?.filter((a) => a.dependencies?.some((d) => {
      return d?.Path?.match(searchTerm)
    }))

    setProcessedManifest({ foundChunks: _.keyBy(foundChunks, 'savedKey') })
  }

  return (
    <main>
      <div className="py-40 w-full">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium leading-6 text-slate-600"
          >
            Search Unreal Engine assets
          </label>
          <div className="mt-2 flex  shadow-sm">
            <div className="relative flex flex-grow items-stretch focus-within:z-10">
              <input
                type="file"
                accept=".json"
                onChange={handleManifestUpload}
                className="w-24 relative -ml-px -mr-px inline-flex items-center gap-x-1.5 rounded-l-md px-3 py-2 text-sm font-semibold text-slate-400 ring-1 ring-inset ring-slate-800 hover:bg-slate-900"
              />
            </div>
            <input
              id="search"
              name="search"
              placeholder="Asset title"
              aria-describedby="email-optional"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full border-0 py-1.5 pl-8 text-slate-400 ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-indigo-900 sm:text-sm sm:leading-6"
            />
            <button
              type="button"
              className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-slate-400 ring-1 ring-inset ring-slate-800 hover:bg-slate-900"
              onClick={handleSearch}
            >
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="-ml-0.5 h-5 w-5 text-slate-400"
              />
              Search
            </button>
          </div>
        </div>
        <div className="spacer"></div>
        <div className="output bg-gray-950 p-8 rounded-xl">

          <JSONTree data={processedManifest} hideRoot shouldExpandNodeInitially={() => true}/>
        </div>
      </div>
    </main>
  )
}
