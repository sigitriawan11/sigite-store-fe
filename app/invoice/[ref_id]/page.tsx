import BaseLayout from "@/components/layouts"
import InvoicePage from "@/components/transactions/InvoicePage"
import { Metadata } from "next"

type Props = {
    params: Promise<{ ref_id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { ref_id } = await params
    return {
        title: `Invoice ${ref_id}`,
    }
}

const InvoicePageRoute = async ({ params }: Props) => {
    const { ref_id } = await params
    return (
        <BaseLayout>
            <div className="max-w-7xl mx-auto">
                <InvoicePage ref_id={ref_id} />
            </div>
        </BaseLayout>
    )
}

export default InvoicePageRoute
