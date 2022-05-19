class NotFoundError extends Error {
  entity;
  entityId;

  constructor(entity, entityId) {
    super(`Entity '${entity}' with id=${entityId} not found`);
    this.entity = entity;
    this.entityId = entityId;
  }
}

module.exports = NotFoundError;
