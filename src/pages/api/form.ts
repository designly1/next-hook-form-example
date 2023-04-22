import formSchema from "@/schema/formSchema";
import *  as Yup from "yup";

// Use Next.js edge runtime
export const config = {
    runtime: 'edge',
}

/**
 * Form handler with Yup schema validation
 * 
 * @author Jay Simons
 */
export default async function handler(request: Request) {
    try {
        const formData = await request.json();

        // Vaidate form data
        try {
            await formSchema.validate(formData, { abortEarly: false });
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                // Retrieve the first validation error and its associated form field
                const errField = err?.inner[0]?.path || '' as string;
                const errMess = err.errors[0];

                throw new Error(JSON.stringify({ errField, errMess }));
            }
        }

        return new Response(JSON.stringify(formData), {
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (err) {
        if (err instanceof Error) {
            return new Response(err.message, { status: 500 });
        }
    }
}