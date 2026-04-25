import LoginComp from "@/components/auth/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Login'
}


const PageLogin = () => {
    return (
        <LoginComp />
    );
};

export default PageLogin;