export function missingStorageFactoryError() {
  return new Error('please provide a "storage" property in session descriptor.');
}

export function missingDescriptorParameterError(parameterName: string) {
  return new Error(
    `please set a "${parameterName}" date in session descriptor or provide the date as parameter.`
  );
}
