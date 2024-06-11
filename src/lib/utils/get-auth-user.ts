'use server';

import { api } from '@/trpc/server';
import { redirect } from 'next/navigation';

export const getAuthUser = async ({
    shouldRedirect = true,
}: {
    shouldRedirect?: boolean;
} = {}) => {
    const res = await api.user.getUser(undefined);
    if (!res.data) {
        if (shouldRedirect) {
            redirect('/login');
        }
        return null;
    }
    return res.data;
};