import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {sign } from 'hono/jwt'
import {signupInput} from "../../../common/src/index"



export const userRouter = new Hono<{
    Bindings:{
        DATABASE_URL:string
        JWT_SECRET:string      
    }
}>()

userRouter.post('/signup' ,async (c) => {
  
try {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    const body = await c.req.json()
   const {success} = signupInput.safeParse(body)
   if (!success) {
    c.status(411)
    return c.json({
       message: "Incorrect Input"
    })
 }
      const user =  await prisma.user.create({
      data:{
        email:body.email,
        password:body.password
      }
    })
      // console.log("U:",user);
      
      const token =  await sign({id:user.id}, c.env.JWT_SECRET)
      return c.json({
        jwt:token
      })
} catch (error) {
    c.status(303)
    return c.json({error: "Signup is faild"})
}
  })
  
  userRouter.post('/signin' ,async (c) => {
  
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate()) 
   
  const body = await c.req.json()
  const {success} = signupInput.safeParse(body)
  if (!success) {
     c.status(411)
     return c.json({
        message: "Incorrect Input"
     })
  }
   const user = await prisma.user.findUnique({
    where:{
      email:body.email,
      password:body.password
    }
   })
     
   if(!user) {
    c.status(403)
    return  c.json({error : "user not found"})
   }
  
   const token =  await sign({id:user.id}, c.env.JWT_SECRET);
  
  
    return c.json({
      jwt:token
    })
  
  })
  