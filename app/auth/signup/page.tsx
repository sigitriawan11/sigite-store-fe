import RegisterComp from "@/components/auth/Register";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Sign Up'
}

const RegisterPage = () => {
    return (
        <RegisterComp />
    )
}

export default RegisterPage