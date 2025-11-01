import { Link, type ValidateToPath } from "@tanstack/react-router";

import { ChevronRight } from "lucide-react";

type TBreadCrumb = {
    label: string,
    href?: ValidateToPath
}

export type BreadCrumbsProps = {
    crumbs: TBreadCrumb[]
}

export default function BreadCrumbs({
    crumbs
}: BreadCrumbsProps) {
    return (
        <ul>
            { crumbs.map((crumb, idx) => <CrumbItem crumb={crumb} idx={idx} key={crumb.label} />) }
        </ul>
    )
}

function CrumbItem({ crumb, idx }: { crumb: TBreadCrumb, idx: number }) {
    return (
        <li className="inline-flex gap-2 items-center">
            { idx>0 && <ChevronRight className="size-4" /> }
            { crumb.href === undefined
                ? crumb.label
                : (
                    <Link to={crumb.href}>{crumb.label}</Link>
                )
            }
        </li>
    )
}