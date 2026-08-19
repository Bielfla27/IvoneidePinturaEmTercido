package br.com.gabrielfelix.ivoneide_pintura_api.common;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

	private static final Set<String> IMAGE_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

	private final Path uploadRoot;

	public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
		this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
	}

	public String storePdf(MultipartFile file) {
		return store(file, "apostilas", Set.of("application/pdf"), ".pdf");
	}

	public int countPdfPages(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("O arquivo PDF e obrigatorio.");
		}

		try (PDDocument document = Loader.loadPDF(file.getBytes())) {
			return document.getNumberOfPages();
		} catch (IOException exception) {
			throw new IllegalArgumentException("Nao foi possivel ler a quantidade de paginas do PDF.", exception);
		}
	}

	public Integer countPdfPagesFromPublicUrl(String publicUrl) {
		if (publicUrl == null || !publicUrl.startsWith("/uploads/")) {
			return null;
		}

		Path pdfPath = uploadRoot.resolve(publicUrl.replaceFirst("^/uploads/", "")).normalize();
		if (!pdfPath.startsWith(uploadRoot) || !Files.exists(pdfPath)) {
			return null;
		}

		try (PDDocument document = Loader.loadPDF(pdfPath.toFile())) {
			return document.getNumberOfPages();
		} catch (IOException exception) {
			return null;
		}
	}

	public String storeCoverImage(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			return null;
		}

		return store(file, "capas", IMAGE_CONTENT_TYPES, ".jpg");
	}

	private String store(MultipartFile file, String folder, Set<String> allowedContentTypes, String defaultExtension) {
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("O arquivo e obrigatorio.");
		}

		String contentType = file.getContentType();
		if (contentType == null || !allowedContentTypes.contains(contentType)) {
			throw new IllegalArgumentException("Tipo de arquivo invalido.");
		}

		try {
			Path folderPath = uploadRoot.resolve(folder).normalize();
			Files.createDirectories(folderPath);

			String extension = extractExtension(file.getOriginalFilename(), defaultExtension);
			String storedFileName = UUID.randomUUID() + extension;
			Path destination = folderPath.resolve(storedFileName).normalize();

			if (!destination.startsWith(folderPath)) {
				throw new IllegalArgumentException("Nome de arquivo invalido.");
			}

			try (InputStream inputStream = file.getInputStream()) {
				Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
			}

			return "/uploads/" + folder + "/" + storedFileName;
		} catch (IOException exception) {
			throw new IllegalStateException("Nao foi possivel salvar o arquivo.", exception);
		}
	}

	private String extractExtension(String originalFilename, String defaultExtension) {
		if (originalFilename == null || !originalFilename.contains(".")) {
			return defaultExtension;
		}

		String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
		if (extension.length() > 10) {
			return defaultExtension;
		}

		return extension;
	}
}
