package br.com.gabrielfelix.ivoneide_pintura_api.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import br.com.gabrielfelix.ivoneide_pintura_api.product.Product;
import br.com.gabrielfelix.ivoneide_pintura_api.product.ProductType;

public class ProductResponse {

	private Long id;
	private String nome;
	private String descricao;
	private BigDecimal preco;
	private ProductType tipo;
	private String urlPdf;
	private String urlImagemCapa;
	private Integer quantidadePaginas;
	private Boolean ativo;
	private LocalDateTime criadoEm;
	private LocalDateTime atualizadoEm;

	public ProductResponse(Product product) {
		this.id = product.getId();
		this.nome = product.getNome();
		this.descricao = product.getDescricao();
		this.preco = product.getPreco();
		this.tipo = product.getTipo();
		this.urlPdf = product.getUrlPdf();
		this.urlImagemCapa = product.getUrlImagemCapa();
		this.quantidadePaginas = product.getQuantidadePaginas();
		this.ativo = product.getAtivo();
		this.criadoEm = product.getCriadoEm();
		this.atualizadoEm = product.getAtualizadoEm();
	}

	public Long getId() {
		return id;
	}

	public String getNome() {
		return nome;
	}

	public String getDescricao() {
		return descricao;
	}

	public BigDecimal getPreco() {
		return preco;
	}

	public ProductType getTipo() {
		return tipo;
	}

	public String getUrlPdf() {
		return urlPdf;
	}

	public String getUrlImagemCapa() {
		return urlImagemCapa;
	}

	public Integer getQuantidadePaginas() {
		return quantidadePaginas;
	}

	public Boolean getAtivo() {
		return ativo;
	}

	public LocalDateTime getCriadoEm() {
		return criadoEm;
	}

	public LocalDateTime getAtualizadoEm() {
		return atualizadoEm;
	}
}
