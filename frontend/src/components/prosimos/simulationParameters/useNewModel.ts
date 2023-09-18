import { useNavigate } from "react-router-dom";
import pix_paths from "../../../router/pix/pix_paths";


const useNewModel = () => {
    const navigate = useNavigate()

    const onUploadNewModel = () => {
        navigate(pix_paths.PROJECTS_PATH)
    };
    
    return { onUploadNewModel }
}

export default useNewModel;