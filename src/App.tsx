import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Plus, Search, FileDown, MoreHorizontal, Filter } from "lucide-react"
import { Control, Input } from "./components/ui/input"
import { Button } from "./components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { Pagination } from "./components/pagination"
import { Header } from "./components/header"
import { Tabs } from "./components/tabs"
import { useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { CreateTagForm } from "./components/create-tag-form"

export interface TagsResponse {
  first: number
  prev: number | null
  next: number
  last: number
  pages: number
  items: number
  data: Tag[]
}

export interface Tag {
  title: string,
  slug: string,
  amountOfVideos: number
  id: string
}


export function App() {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlFilter = searchParams.get('filter') ?? ''

  const [filter, setFilter] = useState(urlFilter)

  function handleFilter() {
    setSearchParams(params => {
      params.set('page', '1')
      params.set('filter', filter)

      return params
    })
  }

  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1

  const { data: TagsResponse, isLoading } = useQuery<TagsResponse>({
    queryKey: ['get-tags', urlFilter, page],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3333/tags?_page=${page}&_per_page=10&title=${urlFilter}`)
      const data = await response.json()

      await new Promise(resolve => setTimeout(resolve, 500))
      
      return data
    },
    placeholderData: keepPreviousData,
  })

  if(isLoading) {
    return null
  }

  return (
    <div className="py-10 space-x-8">
        <div>
          <Header />
          <Tabs />
        </div>

        <main className="max-w-[1200px] mx-auto space-y-5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold ">Tags</h1>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button variant="primary">

                <Plus className="size-3"/>  
                Create New
                </Button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/70">
                  <Dialog.Content className="fixed p-10 space-y-10 right-0 top-0 bottom-0 h-screen min-w-[320px] z-50 bg-zinc-950 border-l border-zinc-900">
                    <div className="space-y-3">
                      <Dialog.Title className="text-xl font-bold">
                        Create Tag
                      </Dialog.Title>

                      <Dialog.Description className="text-sm text-zinc-500">
                        Tags can be used to group videos about similar concepts
                      </Dialog.Description>
                    </div>
                    
                    <CreateTagForm></CreateTagForm>
                  </Dialog.Content>
                </Dialog.Overlay>
              </Dialog.Portal>
            </Dialog.Root> 


          </div>

          <div className="flex items-center justify-between">
            
              <div className="flex items-center">
                <Input variant='filter'>
                  <Search className="size-3" />
                  <Control 
                    placeholder="Search tags..." 
                    onChange={e => setFilter(e.target.value)}
                    value={filter}
                  />
                </Input>
                <Button onClick={handleFilter}>
                  <Filter className="size-3" />
                  Filter
                </Button>
              </div>
              <Button>
                <FileDown></FileDown>
                Export
              </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Amount of videos</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {TagsResponse?.data.map((tag) => {
              return (
                <TableRow key={tag.id}>
                  <TableCell></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{tag.title}</span>
                      <span className="text-xs text-zinc-500">{tag.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {tag.amountOfVideos} video(s)
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          </Table>

          {TagsResponse && <Pagination pages={TagsResponse.pages} items={TagsResponse.items} page={page} />}

        </main>
    </div>
  )
}
