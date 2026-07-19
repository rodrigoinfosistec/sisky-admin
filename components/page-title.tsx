"use client";

import { useEffect } from "react";

interface Props {
    title: string;
}

export default function PageTitle({ title }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            document.title = `${title} | Sisky Admin`;
        }, 100);
        return () => clearTimeout(timer);
    }, [title]);

    return null;
}