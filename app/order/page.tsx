import HomeComp from "@/components/transactions/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Sigite Store'
}

const HomePage = () => {
    return (
        <HomeComp />
    )
}

export default HomePage