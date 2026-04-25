
import BaseLayout from "@/components/layouts"
import CategoryProduct from "@/components/transactions/CategoryProduct"

export default async function PageCategory({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    return (
        <BaseLayout>
            <div className="max-w-7xl mx-auto">
                <CategoryProduct slug={slug} />
            </div>
        </BaseLayout>
    )
}