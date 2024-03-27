import z from 'zod';
const ISO_DATETIME_REGEX = /\d{4}-[01]\d-[0-3]\d/;

const passmatchSchema = z.object({
    //fecha_hora: z.string().regex(ISO_DATETIME_REGEX, 'date must be a valid ISO date'),
    password: z.string(),
    confirmPassword: z.string(),

}).refine(
    (values) => {
        return values.password === values.confirmPassword;
    },
    {
        message: "Passwords must match!",
        path: ["confirmPassword"],
    }
);

export function validatePassMatch(object) {
    return passmatchSchema.safeParse(object);
}



export function validatePartialPassMatch(object) {
    return passmatchSchema.partial().safeParse(object);
}





