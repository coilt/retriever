'use client'

import { useState } from 'react'
import axios from 'axios'
import { MagnifyingGlassIcon, UsersIcon } from '@heroicons/react/20/solid'

export default function Home() {
  const [manifest, setManifest] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [processedManifest, setProcessedManifest] = useState(null)

  const handleManifestUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const manifestContent = JSON.parse(e.target.result);
      console.log('Parsed packageID:', manifestContent.Dependencies.packageID);
      setManifest(manifestContent);
    };
    reader.readAsText(file);
  };

  const handleSearch = async () => {
    console.log('Sending request with manifest:', manifest);
    console.log('Sending request with searchTerm:', searchTerm);
    const response = await axios.post('/api/manifest', { manifest, searchTerm });
    console.log('Response from server:', response.data);
    setProcessedManifest(response.data);
  };

  return (
    <main>
      <div className='py-80 w-full'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium leading-6 text-gray-300'
          >
            Search assets
          </label>
          <div className='mt-2 flex rounded-md shadow-sm'>
            <div className='relative flex flex-grow items-stretch focus-within:z-10'>
              <div className='absolute inset-y-0 left-0 flex items-center pl-3'></div>
              <input
                type='file'
                accept='.json'
                onChange={handleManifestUpload}
                className='block w-full rounded-l-md border-0 py-1.5 pl-8 text-gray-900 ring-1 ring-inset ring-indigo-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
              />
            </div>
            <input
              id='search'
              name='search'
              placeholder='Asset title'
              aria-describedby='email-optional'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='block w-full rounded-l-md border-0 py-1.5 pl-8 text-gray-900 ring-1 ring-inset ring-indigo-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
            />
            <button
              type='button'
              className='relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-400 ring-1 ring-inset ring-gray-800 hover:bg-gray-900'
              onClick={handleSearch}
            >
              <MagnifyingGlassIcon
                aria-hidden='true'
                className='-ml-0.5 h-5 w-5 text-gray-400'
              />
              Search
            </button>
          </div>
        </div>
        {processedManifest && (
          <pre>{JSON.stringify(processedManifest, null, 2)}</pre>
        )}
      </div>
    </main>
  )
}
