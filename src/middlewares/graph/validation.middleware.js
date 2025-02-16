export const validation = async (schema, args) => {
  const validationResult = schema.validate(args, { abortEarly: false });
  if (validationResult.error) {
    throw new Error(validationResult.error.toString());
  }
  return true;
};
