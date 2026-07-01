package br.com.gabrielfelix.ivoneide_pintura_api.product;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.gabrielfelix.ivoneide_pintura_api.product.dto.ProductRequest;

@Service
public class ProductService {

	private final ProductRepository productRepository;

	public ProductService(ProductRepository productRepository) {
		this.productRepository = productRepository;
	}

	public Product create(ProductRequest request) {
		Product product = new Product(
				request.getNome(),
				request.getDescricao(),
				request.getPreco(),
				request.getTipo(),
				request.getUrlPdf(),
				request.getUrlImagemCapa(),
				request.getAtivo() == null ? true : request.getAtivo());

		return productRepository.save(product);
	}

	public List<Product> findAll() {
		return productRepository.findAll();
	}

	public List<Product> findActiveProducts() {
		return productRepository.findByAtivoTrueOrderByNomeAsc();
	}

	public Product findById(Long id) {
		return productRepository.findById(id)
				.orElseThrow(() -> new ProductNotFoundException(id));
	}

	public Product update(Long id, ProductRequest request) {
		Product product = findById(id);
		product.setNome(request.getNome());
		product.setDescricao(request.getDescricao());
		product.setPreco(request.getPreco());
		product.setTipo(request.getTipo());
		product.setUrlPdf(request.getUrlPdf());
		product.setUrlImagemCapa(request.getUrlImagemCapa());
		product.setAtivo(request.getAtivo() == null ? true : request.getAtivo());

		return productRepository.save(product);
	}

	public void delete(Long id) {
		Product product = findById(id);
		productRepository.delete(product);
	}
}
