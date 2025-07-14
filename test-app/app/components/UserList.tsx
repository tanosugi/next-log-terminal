import { logger } from 'next-log-terminal';

interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUsers(): Promise<User[]> {
  logger.info('Fetching users from mock API...');
  logger.debug('Starting fetch-users timer');

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  logger.debug('Users fetched successfully', {
    count: users.length,
    userIds: users.map((u) => u.id),
  });
  logger.debug('Completed fetch-users timer');

  return users;
}

export default async function UserList() {
  logger.info('UserList server component rendering');

  try {
    const users = await fetchUsers();

    logger.info('Rendering user list', { userCount: users.length });

    return (
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="p-3 border rounded-lg">
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </div>
        ))}

        <div className="text-sm text-gray-500 mt-4">
          <p>
            This component demonstrates server-side logging during rendering.
          </p>
          <p>Check your terminal for the server logs!</p>
        </div>
      </div>
    );
  } catch (error) {
    logger.error('Failed to fetch users', error);
    throw error;
  }
}
