"use client";

import { trpc } from "@/trpc/react";
import { api } from "@/trpc/server";
import React, { useState } from "react";

type Props = {
  initialUsers: Awaited<ReturnType<(typeof api)["user"]["getUsers"]>>;
};

const Users = (props: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const users = trpc.user.getUsers.useQuery(undefined, {
    initialData: props.initialUsers,
  });
  const createUser = trpc.user.createUser.useMutation({
    onSettled: () => {
      users.refetch();
    },
  });

  return (
    <div>
      <div>
        {users.data?.map((user) => <div key={user.id}>{user.email}</div>)}
      </div>
      <div>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={() => {
            createUser.mutate({ email, password });
          }}
        >
          Create User
        </button>
      </div>
    </div>
  );
};

export default Users;
