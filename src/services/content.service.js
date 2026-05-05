const MOCK_DELAY = 600;

const getContents = () => {
  if (typeof window === "undefined") return [];
  const contents = localStorage.getItem("broadcast_contents");
  if (contents) {
    return JSON.parse(contents);
  }

  // Initialize with default demo data
  const now = new Date();
  const past = new Date(now.getTime() - 1000 * 60 * 60 * 24);
  const future = new Date(now.getTime() + 1000 * 60 * 60 * 24);

  const defaultData = [
    {
      id: "c_demo_1",
      teacherId: "t1",
      teacherName: "John Doe",
      title: "Welcome to EduBroadcast",
      subject: "General",
      description: "This is a pre-approved demo broadcast that is currently active!",
      fileUrl: null,
      startTime: past.toISOString(),
      endTime: future.toISOString(),
      rotationDuration: 10,
      status: "approved",
      createdAt: past.toISOString(),
    },
  ];
  localStorage.setItem("broadcast_contents", JSON.stringify(defaultData));
  return defaultData;
};

const saveContents = (contents) => {
  localStorage.setItem('broadcast_contents', JSON.stringify(contents));
};

export const contentService = {
  // TEACHER FLOW
  uploadContent: async (contentData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const contents = getContents();
          const newContent = {
            id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...contentData,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          contents.push(newContent);
          saveContents(contents);
          resolve(newContent);
        } catch (error) {
          reject(new Error('Failed to upload content'));
        }
      }, MOCK_DELAY);
    });
  },

  getTeacherContent: async (teacherId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const contents = getContents();
        resolve(contents.filter(c => c.teacherId === teacherId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }, MOCK_DELAY);
    });
  },

  // PRINCIPAL FLOW
  getAllContent: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const contents = getContents();
        resolve(contents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }, MOCK_DELAY);
    });
  },

  updateContentStatus: async (contentId, status, rejectionReason = '') => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const contents = getContents();
          const index = contents.findIndex(c => c.id === contentId);
          if (index === -1) {
            return reject(new Error('Content not found'));
          }
          contents[index] = {
            ...contents[index],
            status,
            ...(status === 'rejected' ? { rejectionReason } : {}),
            updatedAt: new Date().toISOString()
          };
          saveContents(contents);
          resolve(contents[index]);
        } catch (error) {
          reject(new Error('Failed to update status'));
        }
      }, MOCK_DELAY);
    });
  },

  // PUBLIC FLOW
  getActiveTeacherContent: async (teacherId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const contents = getContents();
        const now = new Date();
        const activeContents = contents.filter(c => {
          if (c.teacherId !== teacherId || c.status !== 'approved') return false;
          
          const start = new Date(c.startTime);
          const end = new Date(c.endTime);
          return now >= start && now <= end;
        });
        resolve(activeContents);
      }, MOCK_DELAY);
    });
  }
};
