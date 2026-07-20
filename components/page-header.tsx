import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface Props {
    title: string;
    icon?: ReactNode;
    breadcrumb?: BreadcrumbItem[];
    actions?: ReactNode;
}

export default function PageHeader({ title, icon, breadcrumb, actions }: Props) {
    return (
        <div className="mb-6">
            {breadcrumb && breadcrumb.length > 0 && (
                <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    {breadcrumb.map((item, index) => (
                        <span key={index} className="flex items-center gap-1">
                            {index > 0 && <ChevronRight size={12} />}
                            {item.href ? (
                                <Link href={item.href} className="hover:text-foreground transition-colors">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-foreground">{item.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon && <span className="text-muted-foreground">{icon}</span>}
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                </div>
                {actions && <div>{actions}</div>}
            </div>
        </div>
    );
}