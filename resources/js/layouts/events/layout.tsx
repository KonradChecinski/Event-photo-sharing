import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { useCurrentUrl } from '@/hooks/use-current-url';



export default function EventsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="">
            <div className="flex-1 md:max-w-2xl">
                <section className="max-w-xl space-y-12">{children}</section>
            </div>
        </div>
    );
}
