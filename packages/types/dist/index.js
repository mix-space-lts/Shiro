//#region index.ts
const prefix = "shiro";
const getGlobalComponent = (name) => window[prefix][name];
const useModalStack = ((...args) => window[prefix].useModalStack(...args));
const dangerouslyCreatePortal = window[prefix].dangerouslyCreatePortal;
//#endregion
export { dangerouslyCreatePortal, getGlobalComponent, useModalStack };

//# sourceMappingURL=index.js.map