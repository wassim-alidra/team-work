from cloudinary_storage.storage import MediaCloudinaryStorage
import cloudinary

class AutoOptimizedMediaCloudinaryStorage(MediaCloudinaryStorage):
    def _get_resource_type(self, name):
        import os
        extension = os.path.splitext(name)[1].lower()
        if extension in ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv']:
            return 'raw'
        elif extension in ['.mp4', '.webm', '.ogg', '.mov']:
            return 'video'
        return 'image'

    # Removed custom _get_url to use base class implementation
    pass
