import api from "./api";

export const uploadDocument = async (form: FormData) => {
  const response = await api.post(
    "/documents/upload",
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};