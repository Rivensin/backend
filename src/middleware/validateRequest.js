import { flattenError } from "zod"

export const validateRequest = (schema, source='body') =>{
  return (req,res,next) => {
    const result = schema.safeParse(req[source])

    if(!result.success){
      const errorField = result.error.flatten().fieldErrors;
      const flattenErrors = Object.values(errorField).flat();

      return res.status(400).json({
        message: flattenErrors.join(', ')
      });
    }

    next()
  }
}