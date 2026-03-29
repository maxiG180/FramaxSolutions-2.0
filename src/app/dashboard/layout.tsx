import { Metadata, Viewport } from "next";
import DashboardClientLayout from "./DashboardClientLayout";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Framax Admin",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
