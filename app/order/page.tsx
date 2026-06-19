import { Metadata } from "next";
import BaseLayout from "@/components/layouts";
import OrderTracker from "@/components/transactions/OrderTracker";

export const metadata: Metadata = {
    title: 'Track Order'
}

const OrderPage = () => {
    return (
        <BaseLayout>
            <OrderTracker />
        </BaseLayout>
    )
}

export default OrderPage
