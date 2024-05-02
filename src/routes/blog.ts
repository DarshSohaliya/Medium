import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import {  createBlogInput,updateBlogInput } from "../../../common/src";

export const blogRouter = new Hono<{
    Bindings:{
        DATABASE_URL:string
        JWT_SECRET:string      
    },
    Variables: {
        userId : string;
    }
}>()

blogRouter.use("/*", async (c,next) => {
   try {
    const header = c.req.header("authorization") || ""
    const user =  await verify(header, c.env.JWT_SECRET)
 
    if (user) {
      c.set("userId" , user.id)
    await  next()
     }else{
         c.status(403)
       return c.json({
         message: "You are not logged in"
       })
     }
   } catch (error) {
    c.status(403)
    return c.json({
      message: "You are not logged in"
    })
   }
   
})

blogRouter.post('/' ,async (c) => {
  
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    const body = await c.req.json()
    const userId  = c.get("userId")
    const {success}  = createBlogInput.safeParse(body)
    if (!success) {
        c.status(411)
        return c.json({
           message: "Incorrect Input"
        })
     }
  const post =  await prisma.post.create({
    data:{
        title:body.title,
        content: body.content,
        authorId:userId
    }
   })

    return c.json({
       post
    })
  })
  
  blogRouter.put('/' , async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
   const  body = await c.req.json()
   const {success}  = updateBlogInput.safeParse(body)
   if (!success) {
       c.status(411)
       return c.json({
          message: "Incorrect Input"
       })
    }
  const post =  await prisma.post.update({
    where: {
        id:body.id,
   
    },
    data:{
        title:body.title,
        content: body.content,

    }
   })

    return c.json({
        post
    })
  })


  blogRouter.get('/bulk' ,async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
 try {
  const posts =  await prisma.post.findMany()
  return c.json({
    posts
  })
 } catch (error) {
  c.status(411)
  return c.json({
   message: "Error while fetching blog"
  })
 }
   
  })
  

 blogRouter.get('/:id' ,async (c) => {
  
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
   const  id = await c.req.param("id")
  try {
    const post =  await prisma.post.findUnique({
        where: {
            id:id,
       
        }
       })
    
        return c.json({
            post
        })
  } catch (error) {
    c.status(411)
    return c.json({
        message: "Error while fetching blog post"
    })
  }

  })

  
  
  