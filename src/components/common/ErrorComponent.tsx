export default function ErrorComponent({
    errorMessage
}: {
    errorMessage?: string
}) {
    return (
        <div
            className="mx-auto w-full md:w-1/2"
        >
            <h1>Error</h1>

            <p>
                { errorMessage || "Unknown error occurred." }
            </p>
        </div>
    )
}