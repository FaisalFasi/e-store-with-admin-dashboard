// const file: File = event.target.files[0];
const maxFileSize = 10485760; // bytes
const currentFileSize = file.size;

const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
// Check if file type is allowed
if (!allowedTypes.includes(file.type)) {
  return this.snackBar.open(
    "Invalid file type. Please upload a .jpg, .png, or .pdf file.",
    "OK",
    {
      verticalPosition: "top",
      horizontalPosition: "right",
      duration: 1000,
    }
  );
}
