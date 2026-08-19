package br.com.gabrielfelix.ivoneide_pintura_api.product;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.gabrielfelix.ivoneide_pintura_api.common.FileStorageService;
import br.com.gabrielfelix.ivoneide_pintura_api.product.dto.ProductRequest;

@Service
public class ProductService {

	private final ProductRepository productRepository;
	private final FileStorageService fileStorageService;

	public ProductService(ProductRepository productRepository, FileStorageService fileStorageService) {
		this.productRepository = productRepository;
		this.fileStorageService = fileStorageService;
	}

	public Product create(ProductRequest request) {
		Product product = new Product(
				request.getNome(),
				request.getDescricao(),
				request.getPreco(),
				request.getTipo(),
				request.getUrlPdf(),
				request.getUrlImagemCapa(),
				request.getQuantidadePaginas(),
				request.getAtivo() == null ? true : request.getAtivo());

		return productRepository.save(product);
	}

	public List<Product> findAll() {
		return productRepository.findAll()
				.stream()
				.map(this::fillMissingPageCount)
				.toList();
	}

	public List<Product> findActiveProducts() {
		return productRepository.findByAtivoTrueOrderByNomeAsc()
				.stream()
				.map(this::fillMissingPageCount)
				.toList();
	}

	public Product findById(Long id) {
		Product product = productRepository.findById(id)
				.orElseThrow(() -> new ProductNotFoundException(id));
		return fillMissingPageCount(product);
	}

	public Product update(Long id, ProductRequest request) {
		Product product = findById(id);
		product.setNome(request.getNome());
		product.setDescricao(request.getDescricao());
		product.setPreco(request.getPreco());
		product.setTipo(request.getTipo());
		product.setUrlPdf(request.getUrlPdf());
		product.setUrlImagemCapa(request.getUrlImagemCapa());
		product.setQuantidadePaginas(request.getQuantidadePaginas());
		product.setAtivo(request.getAtivo() == null ? true : request.getAtivo());

		return productRepository.save(product);
	}

	public void delete(Long id) {
		Product product = findById(id);
		productRepository.delete(product);
	}

	private Product fillMissingPageCount(Product product) {
		if (product.getQuantidadePaginas() != null) {
			return product;
		}

		Integer quantidadePaginas = fileStorageService.countPdfPagesFromPublicUrl(product.getUrlPdf());
		if (quantidadePaginas == null) {
			return product;
		}

		product.setQuantidadePaginas(quantidadePaginas);
		return productRepository.save(product);
	}
}
