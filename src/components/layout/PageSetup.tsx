import Layout from "@/components/layout";

export type PageSetupProps = {
    leftSidebar?: () => React.ReactNode,
    mainContent: () => React.ReactNode,
    rightSidebar?: () => React.ReactNode,
}

export default function PageSetup({leftSidebar, mainContent, rightSidebar}: PageSetupProps) {
    return (
        <Layout.Root>
            <Layout.LeftSidebar>{ leftSidebar?.() }</Layout.LeftSidebar>
            <Layout.Main>{ mainContent() }</Layout.Main>
            <Layout.RightSidebar>{ rightSidebar?.() }</Layout.RightSidebar>
        </Layout.Root>
    )
}