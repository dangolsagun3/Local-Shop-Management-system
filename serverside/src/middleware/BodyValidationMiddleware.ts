import {type Request, type Response, type NextFunction} from "express";
import { z } from "zod";

const bodyValidator = (schema: z.ZodTypeAny) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try{
            const data = req.body;

            if (!data){
                throw{code: 422, message: "Data not set"};
            }

            const Response = await schema.parseAsync(data);
            req.body = Response;

            next()
        }
        catch(exception){
            if(exception instanceof z.ZodError) {
                let errBag: Record<string,string> = {}

                exception.issues.map((err) => {
                    errBag[err.path.join(".")] = err.message
                })

                next({code: 400, detail: errBag, message: "Validation Failed"})

            } else {
            next(exception)
            }
        }
    };
};

export default bodyValidator;