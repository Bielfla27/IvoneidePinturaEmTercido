package br.com.gabrielfelix.ivoneide_pintura_api.product;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gabrielfelix.ivoneide_pintura_api.product.dto.ProductRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.product.dto.ProductResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/produtos")
public class ProductController {

	private final ProductService productService;

	public ProductController(ProductService productService) {
		this.productService = productService;
	}

	@PostMapping
	public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
		Product product = productService.create(request);
		return ResponseEntity
				.created(URI.create("/api/produtos/" + product.getId()))
				.body(new ProductResponse(product));
	}

	@GetMapping
	public ResponseEntity<List<ProductResponse>> findAll() {
		List<ProductResponse> products = productService.findAll()
				.stream()
				.map(ProductResponse::new)
				.toList();

		return ResponseEntity.ok(products);
	}

	@GetMapping("/ativos")
	public ResponseEntity<List<ProductResponse>> findActiveProducts() {
		List<ProductResponse> products = productService.findActiveProducts()
				.stream()
				.map(ProductResponse::new)
				.toList();

		return ResponseEntity.ok(products);
	}

	@GetMapping("/{id}")
	public ResponseEntity<ProductResponse> findById(@PathVariable Long id) {
		Product product = productService.findById(id);
		return ResponseEntity.ok(new ProductResponse(product));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
		Product product = productService.update(id, request);
		return ResponseEntity.ok(new ProductResponse(product));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		productService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
