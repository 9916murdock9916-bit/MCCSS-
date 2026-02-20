// core/conflict.js

export const Conflict = {
  resolve(local, remote) {
    if (!remote) return local;
    if (!local) return remote;

    return new Date(remote.updatedAt) > new Date(local.updatedAt)
      ? remote
      : local;
  }
};
