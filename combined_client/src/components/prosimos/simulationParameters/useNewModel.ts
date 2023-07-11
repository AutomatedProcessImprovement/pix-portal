import { useNavigate } from "react-router-dom";
import paths from "../../../router/prosimos/prosimos_paths";


const useNewModel = () => {
    const navigate = useNavigate()

    const onUploadNewModel = () => {
        navigate(paths.SIMULATOR_UPLOAD_PATH)
    };
    
    return { onUploadNewModel }
}

export default useNewModel;