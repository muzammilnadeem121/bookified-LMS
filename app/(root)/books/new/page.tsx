import React from 'react'

const page = () => {
  return (
    <main className='wrapper container'>
        <div className='mx-auto max-w-180 space-y-10'>
            <section className='flex flex-col gap-5'>
                <h1 className='page-title-xl'>Add a new Book</h1>
                <p className="subtitle">
                    upload a PDF to generate your Interactive Interview
                </p>
            </section>
        </div>
    </main>
  )
}

export default page