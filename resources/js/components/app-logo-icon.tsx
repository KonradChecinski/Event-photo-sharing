import type { SVGAttributes } from 'react';
import { Box } from '@mui/material';
import logo from '../../images/logo.png';

export default function AppLogoIcon(props: SVGAttributes<SVGElement> & { className?: string }) {
    return (
        <Box
            component="img"
            src={logo}
            alt="Event Photo Sharing"
            className={props.className || 'size-32 object-contain p-0.5'}
        />
    );
}
