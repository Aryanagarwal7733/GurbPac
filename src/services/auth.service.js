const MOCK_DELAY = 800; // simulate network latency

export const authService = {
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock authentication logic
        if (email === 'principal@school.com' && password === 'password') {
          resolve({
            id: 'p1',
            name: 'Admin Principal',
            role: 'principal',
            email,
          });
        } else if (email === 'teacher@school.com' && password === 'password') {
          resolve({
            id: 't1',
            name: 'John Doe',
            role: 'teacher',
            email,
          });
        } else if (email === 'teacher2@school.com' && password === 'password') {
          resolve({
            id: 't2',
            name: 'Jane Smith',
            role: 'teacher',
            email,
          });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, MOCK_DELAY);
    });
  },
};
