'use server';

import { api } from '@/trpc/server';
import { redirect } from 'next/navigation';

export const getAuthUser = async ({
    shouldRedirect = true,
}: {
    shouldRedirect?: boolean;
} = {}) => {
    return api.user.getUser(undefined)
        .then((result) => result.data.user)
        .catch((e) => {
            if (e.code === 'UNAUTHORIZED' && shouldRedirect) {
                redirect('/login');
            }
            return null;
        });
};