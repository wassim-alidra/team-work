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

    def _get_url(self, name):
        name = self._prepend_prefix(name)
        resource_type = self._get_resource_type(name)
        cloudinary_resource = cloudinary.CloudinaryResource(
            name,
            default_resource_type=resource_type
        )
        
        # Apply automatic format and quality only to images
        if resource_type == 'image':
            return cloudinary_resource.build_url(fetch_format='auto', quality='auto')
        
        return cloudinary_resource.url
