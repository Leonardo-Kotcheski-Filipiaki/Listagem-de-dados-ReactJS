import { Check, Loader, Loader2, X } from "lucide-react";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form"
import { promise, z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import * as Dialog from "@radix-ui/react-dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query";
const createTagSchema = z.object({
    title: z.string().min(3, {message: "Minimun 3 characters."}),
    
})


type CreateTagSchema = z.infer<typeof createTagSchema>

function getSlugFromString(input: string):string {
    return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
}

export function CreateTagForm() {

        const queryClient = useQueryClient()

        const { register, handleSubmit, watch, formState } = useForm<CreateTagSchema>({
            resolver: zodResolver(createTagSchema),
        })    

        const slug = watch('title') 
        ? getSlugFromString(watch('title')) 
        : ''

        const { mutateAsync } = useMutation({
            mutationFn: async ({title}: CreateTagSchema) => {
                await new Promise(resolve => setTimeout(resolve, 2000))

                await fetch('http://localhost:3333/tags', {
                    method: "POST",
                    body: JSON.stringify({
                        title,
                        slug,
                        amountOfVideos: 0,
                    }),
    
                })
            },
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ['get-tags'],
                })
            }
        })

        async function createTag({title}: CreateTagSchema) {
            mutateAsync({title})
        }
        


    return (
        <form onSubmit={handleSubmit(createTag)} className="w-full space-y-6">
            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium block ">Tag name</label>
                <input {...register('title')} type="text" id="title" className="boder-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"/>
            {
                formState.errors?.title && (
                    <p className="text-sm text-red-400">{formState.errors.title.message}</p>
                )
            }
            </div>
            
            <div className="space-y-2">
                <label htmlFor="slug" className="text-sm font-medium block">Slug</label>
                <input value={slug} type="text" id="slug" readOnly className="boder-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"/>
            </div>
            
            <div className="flex items-center justify-end gap-2">
                <Dialog.Close asChild>
                    <Button>
                        <X className="size-3"/>
                        Cancel
                    </Button>
                </Dialog.Close>
                <Button type="submit" disabled={formState.isSubmitting} className="bg-teal-400 text-teal-950">
                    {
                        formState.isSubmitting ? <Loader2 className="size-3 animate-spin"/> : <Check className="size-3"/>
                    }
                    Save
                </Button>
            </div>
        </form>
    )
}