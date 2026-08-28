import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { useCurrentUrl } from '@/hooks/use-current-url';



export default function EventsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="h-full">
            <div className="flex-1">
                <section className="space-y-12">{children}</section>
            </div>
        </div>
    );
}
