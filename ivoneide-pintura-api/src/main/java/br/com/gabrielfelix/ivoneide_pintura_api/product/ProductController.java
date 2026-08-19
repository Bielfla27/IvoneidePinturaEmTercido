package br.com.gabrielfelix.ivoneide_pintura_api.product;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.gabrielfelix.ivoneide_pintura_api.common.FileStorageService;
import br.com.gabrielfelix.ivoneide_pintura_api.product.dto.ProductRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.product.dto.ProductResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/produtos")
public class ProductController {

	private final ProductService productService;
	private final FileStorageService fileStorageService;

	public ProductController(ProductService productService, FileStorageService fileStorageService) {
		this.productService = productService;
		this.fileStorageService = fileStorageService;
	}

	@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
		Product product = productService.create(request);
		return ResponseEntity
				.created(URI.create("/api/produtos/" + product.getId()))
				.body(new ProductResponse(product));
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ProductResponse> createWithFiles(
			@RequestParam String nome,
			@RequestParam String descricao,
			@RequestParam BigDecimal preco,
			@RequestParam ProductType tipo,
			@RequestParam MultipartFile arquivoPdf,
			@RequestParam(required = false) MultipartFile imagemCapa,
			@RequestParam(defaultValue = "true") Boolean ativo) {
		Integer quantidadePaginas = fileStorageService.countPdfPages(arquivoPdf);
		String urlPdf = fileStorageService.storePdf(arquivoPdf);
		String urlImagemCapa = fileStorageService.storeCoverImage(imagemCapa);
		ProductRequest request = buildProductRequest(nome, descricao, preco, tipo, urlPdf, urlImagemCapa,
				quantidadePaginas, ativo);
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

	@PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
		Product product = productService.update(id, request);
		return ResponseEntity.ok(new ProductResponse(product));
	}

	@PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ProductResponse> updateWithFiles(
			@PathVariable Long id,
			@RequestParam String nome,
			@RequestParam String descricao,
			@RequestParam BigDecimal preco,
			@RequestParam ProductType tipo,
			@RequestParam(required = false) MultipartFile arquivoPdf,
			@RequestParam(required = false) MultipartFile imagemCapa,
			@RequestParam(defaultValue = "true") Boolean ativo) {
		Product currentProduct = productService.findById(id);

		String urlPdf = currentProduct.getUrlPdf();
		Integer quantidadePaginas = currentProduct.getQuantidadePaginas();

		if (arquivoPdf != null && !arquivoPdf.isEmpty()) {
			quantidadePaginas = fileStorageService.countPdfPages(arquivoPdf);
			urlPdf = fileStorageService.storePdf(arquivoPdf);
		}

		String urlImagemCapa = currentProduct.getUrlImagemCapa();

		if (imagemCapa != null && !imagemCapa.isEmpty()) {
			urlImagemCapa = fileStorageService.storeCoverImage(imagemCapa);
		}

		ProductRequest request = buildProductRequest(nome, descricao, preco, tipo, urlPdf, urlImagemCapa,
				quantidadePaginas, ativo);
		Product product = productService.update(id, request);

		return ResponseEntity.ok(new ProductResponse(product));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		productService.delete(id);
		return ResponseEntity.noContent().build();
	}

	private ProductRequest buildProductRequest(String nome, String descricao, BigDecimal preco, ProductType tipo,
			String urlPdf, String urlImagemCapa, Integer quantidadePaginas, Boolean ativo) {
		ProductRequest request = new ProductRequest();
		request.setNome(nome);
		request.setDescricao(descricao);
		request.setPreco(preco);
		request.setTipo(tipo);
		request.setUrlPdf(urlPdf);
		request.setUrlImagemCapa(urlImagemCapa);
		request.setQuantidadePaginas(quantidadePaginas);
		request.setAtivo(ativo);

		return request;
	}
}
